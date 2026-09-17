import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ email, password });
    navigate('/');
  };

  return (
    <Card className="p-8 flex flex-col items-center max-w-sm w-full mx-auto shadow-md">
      <Avatar bgColor="bg-blue-600" textColor="text-white" className="mb-4 shadow-sm">
        <Lock className="w-6 h-6" />
      </Avatar>
      
      <h1 className="text-2xl font-medium mb-2 text-gray-800">Sign in</h1>
      <p className="text-sm text-gray-500 mb-6">Use your Account</p>

      <form onSubmit={handleSubmit} className="w-full">
        <Input
          label="Email Address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        
        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="mt-2 mb-6 text-left">
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        
        <div className="flex justify-between items-center w-full">
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
            Create account
          </a>
          <Button type="submit">
            Next
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SignInPage;
