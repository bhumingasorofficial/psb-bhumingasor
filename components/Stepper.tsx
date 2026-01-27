
import React from 'react';

interface StepperProps {
    steps: string[];
    currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="w-full px-0 sm:px-2">
            <div className="flex items-center justify-between relative">
                
                {/* Connecting Lines Layer */}
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-4 sm:px-8 z-0">
                    {steps.slice(0, -1).map((_, index) => {
                         const stepIndex = index + 1;
                         const isCompleted = currentStep > stepIndex;
                         return (
                             <div key={index} className="flex-1 h-[2px] mx-1 sm:mx-2 bg-slate-100 relative">
                                 <div 
                                    className={`absolute inset-0 bg-emerald-500 transition-all duration-700 ease-out origin-left ${isCompleted ? 'scale-x-100' : 'scale-x-0'}`}
                                 ></div>
                             </div>
                         )
                    })}
                </div>

                {/* Nodes Layer */}
                {steps.map((step, index) => {
                    const stepIndex = index + 1;
                    const isCompleted = currentStep > stepIndex;
                    const isCurrent = currentStep === stepIndex;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                            {/* Circle Node */}
                            <div 
                                className={`
                                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 border-2
                                    ${isCompleted 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : isCurrent 
                                        ? 'bg-white border-emerald-500 text-emerald-600 scale-110 shadow-lg shadow-emerald-100' 
                                        : 'bg-white border-slate-200 text-slate-300'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    stepIndex
                                )}
                            </div>

                            {/* Label - Hidden on Mobile */}
                            <span 
                                className={`
                                    hidden sm:block text-[10px] sm:text-xs font-bold uppercase tracking-wider absolute -bottom-8 whitespace-nowrap transition-colors duration-300
                                    ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-600/70' : 'text-slate-300'}
                                `}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="h-0 sm:h-4"></div> {/* Spacer adjusted for mobile */}
        </div>
    );
};

export default Stepper;
