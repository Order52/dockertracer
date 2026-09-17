import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Server } from 'lucide-react';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';

const apps = [
  { id: 'made-by', name: 'Made by alihuge', icon: <User className="w-8 h-8" />, path: '#', color: 'text-red-500' },
  { id: 'docker-tracer', name: 'Docker Tracer', icon: <Server className="w-8 h-8" />, path: '/docker-tracer', color: 'text-blue-600' },
];

const AppsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-4xl text-center mb-12 font-light text-gray-800">
        Welcome to <span className="font-medium">The Huge Space</span> 👋
      </h1>
      
      <div className="flex flex-wrap gap-8 justify-center">
        {apps.map((app) => (
          <div key={app.id} className="w-full sm:w-[45%] md:w-[30%] max-w-[250px]">
            <Card className="h-full bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors">
              <button 
                onClick={() => app.path !== '#' && navigate(app.path)}
                className="w-full h-full flex flex-col items-center justify-center p-6 rounded-2xl focus:outline-none"
              >
                <Avatar bgColor="bg-white" textColor={app.color} className="w-16 h-16 mb-4 shadow-md">
                  {app.icon}
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-gray-800">{app.name}</h3>
                </div>
              </button>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsPage;
