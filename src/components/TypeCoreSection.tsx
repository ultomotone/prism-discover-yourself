import React from 'react';
import { TYPE_CORE_DESCRIPTIONS } from '@/data/typeCoreDescriptions';

interface TypeCoreSectionProps {
  typeCode: string;
  className?: string;
}

export const TypeCoreSection: React.FC<TypeCoreSectionProps> = ({ typeCode, className = "" }) => {
  const coreData = TYPE_CORE_DESCRIPTIONS[typeCode];
  
  if (!coreData) {
    console.warn(`No core description found for type: ${typeCode}`);
    return null;
  }
  
  return (
    <section className={`p-6 border rounded-2xl bg-card prism-shadow-card ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-primary">Core</h2>
      {coreData.paragraphs.map((paragraph, index) => (
        <p key={index} className="text-lg leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </section>
  );
};