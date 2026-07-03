import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';

export default function CreatePollModal({ isOpen, onClose, onCreatePoll }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']); // Starts with 2 options minimum

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (!question.trim() || validOptions.length < 2) return;

    onCreatePoll(question, validOptions);
    setQuestion('');
    setOptions(['', '']);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans animate-fadeIn">
      <div className="bg-[#FBF9F6] rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="p-5 pb-3 relative text-center border-b border-gray-100 bg-white">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
            Create Voting Poll
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">Poll Question</label>
            <input 
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Where should we eat dinner?"
              className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1">Options ({options.length}/5)</label>
            
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input 
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 h-10 px-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-[#114B32] transition-all shadow-sm"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 py-2 border border-dashed border-gray-300 rounded-xl text-[11px] font-bold text-gray-500 hover:text-[#114B32] hover:border-[#114B32]/30 flex items-center justify-center gap-1 transition-all cursor-pointer bg-white/50"
              >
                <Plus className="w-3 h-3" />
                Add Option
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-[#114B32] hover:bg-[#0B3D25] text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              Post Poll
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}