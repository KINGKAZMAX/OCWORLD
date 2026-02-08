import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

export default function SocialCard() {
  const [editing, setEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [profile, setProfile] = useState({
    name: "陆玖",
    username: "@OCWorld_Miku",
    bio: "OC创作爱好者 | 像素艺术",
    avatar: "🧙‍♂️",
    website: "weibo.com/OCWorld",
  });

  const socialLinks = [
    { icon: "💬", name: "Discord" },
    { icon: "🐦", name: "Twitter" },
    { icon: "💚", name: "WeChat" },
    { icon: "📷", name: "Instagram" },
    { icon: "🔴", name: "Weibo" },
  ];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">📇 社交名片</h1>
        <p className="text-center text-gray-600 mb-6">扫码加好友</p>

        {/* Card Preview */}
        <motion.div
          ref={cardRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="pixel-card p-6 bg-gradient-to-br from-white to-blue-50 mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-black flex items-center justify-center text-4xl">
              {profile.avatar}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h2 className="font-bold text-2xl mb-1">{profile.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{profile.username}</p>
              <p className="text-sm">{profile.bio}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-between bg-white p-4 border-4 border-black">
            <div>
              <p className="font-bold mb-1">扫码加好友</p>
              <p className="text-xs text-gray-500">{profile.website}</p>
            </div>
            <div className="border-2 border-black p-1 bg-white">
              <QRCodeSVG 
                value={`https://${profile.website}`}
                size={80}
                level="M"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3 mt-4">
            {socialLinks.map((link) => (
              <button
                key={link.name}
                className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl hover:bg-gray-100"
                title={link.name}
              >
                {link.icon}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button className="flex-1" onClick={() => setEditing(!editing)}>
            ✏️ 编辑信息
          </Button>
          <Button variant="outline" className="flex-1">
            📤 分享名片
          </Button>
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="pixel-card p-4 bg-white"
          >
            <h3 className="font-bold mb-4">编辑名片</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">昵称</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">用户名</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">简介</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3 py-2 border-4 border-black resize-none"
                  rows={2}
                />
              </div>
              <Button onClick={() => setEditing(false)} className="w-full">
                保存
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
