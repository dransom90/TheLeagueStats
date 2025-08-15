import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../@/components/ui/card";

type FlipAwardCardProps = {
  emoji: string;
  title: string;
  description: string;
  frontContent?: React.ReactNode;
};

export function FlipAwardCard({
  emoji,
  title,
  description,
  frontContent,
}: FlipAwardCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-72 h-48 [perspective:1000px] cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <Card className="absolute inset-0 flex flex-col h-full bg-black text-white backface-hidden">
          {/* Fixed Title */}
          <div className="p-2 text-center border-b border-gray-700 shrink-0">
            <h3 className="font-semibold text-xl text-green-500">
              {emoji} {title}
            </h3>
          </div>

          {/* Scrollable Content */}
          <CardContent className="flex-1 min-h-0 overflow-y-auto p-3">
            {frontContent}
          </CardContent>
        </Card>

        {/* Back Side */}
        <Card className="absolute inset-0 flex flex-col h-full bg-black text-white backface-hidden rotate-y-180">
          <CardContent className="flex-1 overflow-y-auto p-3">
            <p className="text-center">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
