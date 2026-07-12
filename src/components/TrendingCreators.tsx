import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Users } from "lucide-react";
import { slugifyModel } from "@/lib/videos";
import { getModelUrl } from "@/lib/model-utils";

interface TrendingCreator {
  id: string;
  name: string;
  image: string;
  followers: string;
  views: string;
}

const trendingCreators: TrendingCreator[] = [
  {
    id: "alanareignn",
    name: "AlanaReignn",
    image: "https://i.ibb.co/tpvyfXMR/profile-2.png",
    followers: "125K",
    views: "2.4M"
  },
  {
    id: "ashwitha",
    name: "Ashwitha",
    image: "https://i.ibb.co/N6RZLC4S/s1-s1-Ashwitha4real.webp",
    followers: "89K",
    views: "1.1M"
  },
  {
    id: "aysel-elid",
    name: "aysel_elid",
    image: "https://i.ibb.co/6c2jtZW9/profile.png",
    followers: "45K",
    views: "850K"
  },
  {
    id: "jasmine678",
    name: "jasmine678",
    image: "https://i.ibb.co/7JLhRyDD/1-4.jpg",
    followers: "67K",
    views: "920K"
  },
  {
    id: "demieliss",
    name: "Demieliss",
    image: "https://i.ibb.co/G4bDZKnS/Portrait.png",
    followers: "102K",
    views: "1.8M"
  }
];

export const TrendingCreators = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6">
      <h3 className="text-[10px] font-black tracking-[0.3em] text-primary mb-6 uppercase flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-primary" />
        Trending Creators
      </h3>
      <div className="space-y-6">
        {trendingCreators.map((creator, idx) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link
              to={getModelUrl(creator.name)}
              className="group flex items-center gap-4 transition-all"
            >
              <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors truncate uppercase italic">
                  {creator.name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-[9px] font-black tracking-widest text-white/40 uppercase">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-primary/60" />
                    {creator.followers}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
