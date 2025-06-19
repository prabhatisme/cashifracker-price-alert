
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray to-white flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-gray mb-4">
            💰 CashiFracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Track Refurbished Tech Deals
          </p>
          <p className="text-lg text-gray-500">
            Never Miss a Drop.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-gradient-start to-gradient-end hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
          </Button>
          
          <div className="text-sm text-gray-500">
            Start tracking Cashify deals today
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
