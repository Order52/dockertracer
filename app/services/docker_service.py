import docker

class DockerService:
    def __init__(self):
        self.client = docker.from_env()

    def list_images(self):
        images = self.client.images.list()
        res = []
        for img in images:
            tags = img.tags
            if tags:
                res.append(tags[0])
        return res

    def pull_image(self, image_name):
        try:
            self.client.images.pull(image_name)
            return {"status": "success", "image": image_name}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def deploy_container(self, name, image, port_mappings=None, env_vars=None):
        ports = {}
        if port_mappings:
            for mapping in port_mappings.split(","):
                mapping = mapping.strip()
                if mapping:
                    parts = mapping.split(":")
                    if len(parts) == 2:
                        ports[parts[1]] = int(parts[0])

        environment = {}
        if env_vars:
            for ev in env_vars.split(","):
                ev = ev.strip()
                if "=" in ev:
                    k, v = ev.split("=", 1)
                    environment[k] = v

        try:
            container = self.client.containers.run(
                image,
                name=name,
                ports=ports,
                environment=environment,
                detach=True,
                tty=True,
                stdin_open=True
            )
            return {"status": "success", "id": container.id, "name": container.name}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def connect_containers(self, container1_name, container2_name):
        try:
            c1 = self.client.containers.get(container1_name)
            c2 = self.client.containers.get(container2_name)
            
            net_name = f"net_{container1_name}_{container2_name}"
            try:
                network = self.client.networks.get(net_name)
            except docker.errors.NotFound:
                network = self.client.networks.create(net_name, driver="bridge")

            try:
                network.connect(c1)
            except: pass
            
            try:
                network.connect(c2)
            except: pass

            return {"status": "success", "network": net_name}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def launch_topology(self, nodes, edges):
        results = []
        # 1. Deploy all nodes
        for node in nodes:
            res = self.deploy_container(
                name=node.get("name"),
                image=node.get("image"),
                port_mappings=node.get("ports"),
                env_vars=node.get("envs")
            )
            results.append({"node": node.get("name"), "result": res})
            
        # 2. Connect the edges
        for edge in edges:
            source = edge.get("source")
            target = edge.get("target")
            self.connect_containers(source, target)
            
        return {"status": "success", "details": results}

    def remove_container(self, name):
        try:
            container = self.client.containers.get(name)
            container.stop()
            container.remove()
            return {"status": "success"}
        except docker.errors.NotFound:
            return {"status": "success"} # Already removed
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def stop_topology(self, nodes):
        results = []
        for node in nodes:
            res = self.remove_container(node.get("name"))
            results.append({"node": node.get("name"), "result": res})
        return {"status": "success", "details": results}

