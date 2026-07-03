import React, { useState, useRef } from 'react';
import { X, Image, UserPlus, Check } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showFriendList, setShowFriendList] = useState(false);
  
  const fileInputRef = useRef(null);

  // 🌟 UPDATED: Mock data now contains real structural DB matching sequential IDs
  const friendList = [
    { id: 2, name: 'Sophea', initials: 'SV' },
    { id: 3, name: 'Dara', initials: 'DA' },
    { id: 4, name: 'Bona', initials: 'BN' },
    { id: 5, name: 'Sreyneang', initials: 'SN' }
  ];

  if (!isOpen) return null;

  const toggleMember = (friend) => {
    if (selectedMembers.some(m => m.id === friend.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== friend.id));
    } else {
      setSelectedMembers([...selectedMembers, friend]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    // Send data up to state handlers/database endpoints
    onCreateGroup({
      name: groupName.trim(),
      imageFile: groupImage, // Raw file ready to upload via FormData object
      // 🌟 NEW: Extracting clean user IDs for the pivot table save cycle
      memberIds: selectedMembers.map(m => m.id) 
    });

    // Reset fields
    setGroupName('');
    setSelectedMembers([]);
    setGroupImage(null);
    setImagePreview('');
    setShowFriendList(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-[#F3EFEA] rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 mx-4 relative">
        
        <button 
          type="button" 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-medium text-center text-gray-800 mb-6 tracking-wide">
          Create Group
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <input
            type="text"
            required
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="w-full text-center px-6 py-4 bg-[#EDE6DF] text-gray-700 placeholder-gray-400 rounded-full text-base border-none focus:outline-none focus:ring-2 focus:ring-[#0F5132]/20 transition-all"
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowFriendList(!showFriendList)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#EDE6DF] text-gray-500 rounded-full text-base transition-colors hover:bg-[#E5DCD4]"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {selectedMembers.length === 0 
                  ? '+Add Member' 
                  : `+Add Member (${selectedMembers.length} selected)`}
              </span>
            </button>

            {showFriendList && (
              <div className="bg-[#EDE6DF]/60 rounded-2xl p-3 flex flex-col gap-1.5 max-h-40 overflow-y-auto transition-all">
                <p className="text-[11px] font-bold text-gray-400 px-2 uppercase tracking-wider">Select Friends</p>
                {friendList.map((friend) => {
                  const isChecked = selectedMembers.some(m => m.id === friend.id);
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => toggleMember(friend)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isChecked ? 'bg-white text-[#0F5132] font-medium' : 'hover:bg-white/40 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 bg-gray-300 text-[10px] text-gray-600 rounded-full flex items-center justify-center font-bold">
                          {friend.initials}
                        </span>
                        <span>{friend.name}</span>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-[#0F5132]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-44 bg-[#EDE6DF] rounded-3xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300/50 hover:border-gray-400/70 cursor-pointer overflow-hidden transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />

            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-gray-500 transition-colors">
                <Image className="w-8 h-8 stroke-[1.5] mb-1 text-gray-400/80" />
                <span className="text-sm font-light tracking-wide">Upload Group Image</span>
                <span className="text-[10px] text-gray-400/60 mt-0.5 font-light">(Optional)</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!groupName.trim()}
            className="w-full mt-2 py-4 bg-[#0F5132] hover:bg-[#0B3D25] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-full text-base shadow-sm transition-all"
          >
            Confirm & Launch
          </button>

        </form>
      </div>
    </div>
  );
}