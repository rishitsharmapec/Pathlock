import React from 'react';
import { X } from 'lucide-react';
import SmartScheduler from './SmartScheduler';

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SchedulerModal: React.FC<SchedulerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
          
          {/* Scheduler Content */}
          <SmartScheduler />
        </div>
      </div>
    </div>
  );
};

export default SchedulerModal;