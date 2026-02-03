import React, { useState, useEffect } from 'react';
import { UserCircle, Plus, X } from 'lucide-react';
import { getAllUsers, createUser } from '../services/database-service';
import { DbUser } from '../types';

interface UserSelectorProps {
  currentUserId: string | null;
  onUserSelect: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ currentUserId, onUserSelect }) => {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    setIsCreating(true);
    const userId = newUserName.toLowerCase().replace(/\s+/g, '-');
    const user = await createUser(userId, newUserName);

    if (user) {
      setUsers(prev => [...prev, user]);
      onUserSelect(user.id);
      setNewUserName('');
      setShowNewUserForm(false);
      setShowDropdown(false);
    }
    setIsCreating(false);
  };

  const currentUser = users.find(u => u.id === currentUserId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-warm-300 rounded-xl hover:bg-warm-50 transition-all shadow-sm"
      >
        <UserCircle className="w-5 h-5 text-warm-600" />
        <span className="font-medium text-warm-900">
          {currentUser ? currentUser.name : 'Select User'}
        </span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowDropdown(false);
              setShowNewUserForm(false);
            }}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-warm-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {!showNewUserForm ? (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserSelect(user.id);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors ${
                        user.id === currentUserId ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-warm-900'
                      }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowNewUserForm(true)}
                  className="w-full px-4 py-3 text-left border-t border-warm-200 hover:bg-teal-50 transition-colors text-teal-600 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              </>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-warm-900">New User</h3>
                  <button
                    onClick={() => setShowNewUserForm(false)}
                    className="text-warm-400 hover:text-warm-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
                  placeholder="Enter name..."
                  className="w-full px-3 py-2 border border-warm-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 mb-3"
                  autoFocus
                  disabled={isCreating}
                />
                <button
                  onClick={handleCreateUser}
                  disabled={!newUserName.trim() || isCreating}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserSelector;
