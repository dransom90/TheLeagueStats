import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function UnderConstructionTab() {
  return (
    <div className="relative flex justify-center items-center py-12 mt-10">
      {/* Animated glow background */}
      <motion.div
        className="absolute rounded-2xl blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)",
          width: "400px",
          height: "400px",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      />

      {/* Main Card */}
      <Card className="bg-[#f9fafb] dark:bg-[#1e1e1e] p-8 text-center space-y-4 shadow-lg relative z-10">
        <CardHeader>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <CardTitle className="text-2xl font-bold text-yellow-400">
              This Tab is Under Construction 🛠️
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg text-gray-700 dark:text-gray-300"
          >
            The stats for this section are still cooking. When it’s ready,
            you’ll have another way to trash talk your league mates.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-md text-gray-500 dark:text-gray-400 italic"
          >
            Come back soon — or risk being unprepared for the next matchup.
          </motion.p>
        </CardContent>
      </Card>
    </div>
  );
}
