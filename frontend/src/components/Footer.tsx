import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';
import schoolLogo from '../assets/logo.jpg';

export const Footer: React.FC = () => {
  const mapQuery = encodeURIComponent(`${SCHOOL_INFO.name}, ${SCHOOL_INFO.address}`);
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <footer className="w-full bg-[#135f92] text-white py-10 relative z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: School Info */}
          <div className="flex flex-col gap-3 text-sm">
            <h3 className="text-base font-bold uppercase mb-2">TRƯỜNG {SCHOOL_INFO.name}</h3>
            
            <div className="flex items-start gap-2">
              <span className="font-semibold w-16 shrink-0">Địa chỉ:</span>
              <span>{SCHOOL_INFO.address}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold w-16 shrink-0">Hotline:</span>
              <span>{SCHOOL_INFO.hotline}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold w-16 shrink-0">Email:</span>
              <span>{SCHOOL_INFO.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold w-16 shrink-0">Website:</span>
              <span>dtd.edu.vn</span>
            </div>
          </div>

          {/* Column 2: Facebook Page Plugin Mockup */}
          <div className="w-full bg-white h-[200px] flex items-center justify-center p-1 border border-gray-200">
            <div className="w-full h-full relative">
               {/* This is a visual mockup of a Facebook Page Plugin as seen in the screenshot */}
               <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://source.unsplash.com/random/400x150/?school)' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
               <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
                 <img src={schoolLogo} alt="Logo" className="w-12 h-12 border-2 border-white bg-white" />
                 <div>
                   <div className="text-white font-bold text-lg leading-tight truncate">THPT Đặng Trần Đức</div>
                   <div className="text-white/90 text-xs">40.128 người theo dõi</div>
                 </div>
               </div>
               <div className="absolute bottom-2 left-2 z-10 bg-[#e9ebee] border border-[#ccd0d5] text-[#4b4f56] px-2 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#d8dce2]">
                 <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                   <path d="M15 1H1C.4 1 0 1.4 0 2v12c0 .6.4 1 1 1h7.5V10h-2V7.5h2V5.5c0-2.1 1.2-3.3 3.1-3.3.9 0 1.7.1 1.9.1v2.2h-1.3c-1 0-1.2.5-1.2 1.2v1.8h2.4L14 10h-2v5h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z"></path>
                 </svg>
                 Theo dõi Trang
               </div>
            </div>
          </div>

          {/* Column 3: Google Maps */}
          <div className="w-full bg-gray-200 h-[200px] overflow-hidden">
            <iframe
              title={`Bản đồ ${SCHOOL_INFO.name}`}
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </footer>
  );
};
