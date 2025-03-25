import React from "react";

const Chat = () => {
  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="flex items-center p-4 border-b border-gray-300">
        <button
          className="mr-4 px-4 py-2 bg-black text-white rounded-lg"
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="bg-black text-white rounded-lg p-2 max-w-xs">Hello!</div>
        </div>
        <div className="flex justify-end mb-4">
          <div className="bg-gray-300 text-black rounded-lg p-2 max-w-xs">Hi there!</div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-300">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full p-2 border border-gray-400 rounded-lg"
        />
      </div>
    </div>
  );
};

export default Chat;
