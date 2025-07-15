'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Zap, Brain, Shield, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Model, Vote } from '@/types';

interface VoteModalProps {
  model: Model;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoteSubmit: (vote: Vote) => void;
}

const performanceOptions = [
  { value: 4, label: 'Excellent', emoji: '🚀' },
  { value: 3, label: 'Good', emoji: '✨' },
  { value: 2, label: 'Average', emoji: '😐' },
  { value: 1, label: 'Poor', emoji: '🔧' },
];

const speedOptions = [
  { value: 5, label: 'Lightning', emoji: '⚡' },
  { value: 4, label: 'Fast', emoji: '🏃' },
  { value: 3, label: 'Normal', emoji: '🚶' },
  { value: 2, label: 'Slow', emoji: '🐌' },
  { value: 1, label: 'Turtle', emoji: '🐢' },
];

const intelligenceOptions = [
  { value: 5, label: 'Brilliant', emoji: '🧠' },
  { value: 4, label: 'Smart', emoji: '💡' },
  { value: 3, label: 'Okay', emoji: '🤔' },
  { value: 2, label: 'Confused', emoji: '❓' },
  { value: 1, label: 'Brain Fog', emoji: '🌫️' },
];

const reliabilityOptions = [
  { value: 4, label: 'Rock Solid', emoji: '🗿' },
  { value: 3, label: 'Stable', emoji: '✅' },
  { value: 2, label: 'Flaky', emoji: '🎲' },
  { value: 1, label: 'Broken', emoji: '🔴' },
];

const issueTypes = [
  { value: 'hallucination', label: 'Hallucinations' },
  { value: 'refused', label: 'Refused Tasks' },
  { value: 'off-topic', label: 'Off-Topic' },
  { value: 'slow', label: 'Too Slow' },
  { value: 'error', label: 'Errors' },
  { value: 'other', label: 'Other' },
];

export function VoteModal({ model, open, onOpenChange, onVoteSubmit }: VoteModalProps) {
  const [ratings, setRatings] = useState<Vote['ratings']>({});
  const [issueType, setIssueType] = useState<string>('');
  const [step, setStep] = useState(0);

  const handleRatingSelect = (category: keyof Vote['ratings'], value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
    setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      } else if (step === 3) {
        // Auto advance to final step after last rating
        setStep(4);
      }
    }, 300);
  };

  const handleSubmit = () => {
    onVoteSubmit({
      modelId: model.id,
      ratings,
      issueType: issueType as Vote['issueType'],
    });
    setRatings({});
    setIssueType('');
    setStep(0);
    onOpenChange(false);
  };

  const categories = [
    { key: 'performance', icon: Gauge, label: 'Performance', options: performanceOptions },
    { key: 'speed', icon: Zap, label: 'Speed', options: speedOptions },
    { key: 'intelligence', icon: Brain, label: 'Intelligence', options: intelligenceOptions },
    { key: 'reliability', icon: Shield, label: 'Reliability', options: reliabilityOptions },
  ];

  const currentCategory = categories[step];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] w-[90vw] max-w-md bg-card rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6">
            <Dialog.Title className="text-xl font-semibold mb-1">
              How&apos;s {model.name} today?
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground text-sm mb-6">
              Rate your experience with this model
            </Dialog.Description>
            
            <div className="flex gap-1 mb-6">
              {categories.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    idx <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {step < 4 && currentCategory && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <currentCategory.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{currentCategory.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentCategory.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRatingSelect(currentCategory.key as keyof Vote['ratings'], option.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:scale-105 flex flex-col items-center justify-center h-24",
                        ratings[currentCategory.key as keyof Vote['ratings']] === option.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border hover:border-muted-foreground hover:shadow-sm"
                      )}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium">Any specific issues? (Optional)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {issueTypes.map((issue) => (
                    <button
                      key={issue.value}
                      onClick={() => setIssueType(issue.value)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm transition-all font-medium",
                        issueType === issue.value
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted hover:bg-accent hover:shadow-sm"
                      )}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIssueType('');
                      handleSubmit();
                    }}
                    className="flex-1 py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!issueType}
                  >
                    Submit with Issue
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Dialog.Close className="absolute right-4 top-4 p-1 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}