from app.repositories.container import ContainerRepository

class TopologyService:
    def __init__(self, repo: ContainerRepository):
        self.repo = repo

    def get_topology_map(self) -> dict:
        topology = {}
        
        # 1. Fetch live containers from Docker daemon
        try:
            import docker
            client = docker.from_env()
            for c in client.containers.list():
                networks = c.attrs.get("NetworkSettings", {}).get("Networks", {})
                if not networks:
                    networks = {"none": {"IPAddress": "No IP"}}
                
                # Container ports
                ports = c.attrs.get("NetworkSettings", {}).get("Ports", {})
                port_list = []
                if ports:
                    for k, v in ports.items():
                        if v:
                            port_list.append(f"{v[0]['HostPort']}->{k}")
                port_str = ", ".join(port_list) if port_list else "No Port"
                
                for net_name, net_info in networks.items():
                    ip = net_info.get("IPAddress") or "No IP"
                    
                    if net_name not in topology:
                        topology[net_name] = []
                    
                    # Prevent duplicates if a container is somehow registered multiple times
                    topology[net_name].append({
                        "name": f"{c.name} (Live)",
                        "ip": ip,
                        "port": port_str
                    })
        except Exception as e:
            print(f"Failed to connect to docker: {e}")

        # 2. Fetch manual containers from DB
        containers = self.repo.get_all()
        for c in containers:
            if c.network not in topology:
                topology[c.network] = []
            topology[c.network].append({
                "name": f"{c.name} (DB)",
                "ip": c.ip_address,
                "port": c.port or "No Port"
            })
            
        return topology
