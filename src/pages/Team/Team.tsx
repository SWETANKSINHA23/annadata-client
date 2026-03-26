import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// Team member data
const teamMembers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    position: "Founder & CEO",
    bio: "Agricultural economist with 15+ years experience in the sector. Founded Annadata to bridge the gap between farmers and markets.",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1470&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/rajeshkumar",
      twitter: "https://twitter.com/rajeshkumar",
      email: "rajesh@annadata.com"
    }
  },
  {
    id: 2,
    name: "Priya Singh",
    position: "Chief Technology Officer",
    bio: "Tech leader with expertise in building scalable platforms. Passionate about leveraging technology to solve real-world agricultural challenges.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/priyasingh",
      twitter: "https://twitter.com/priyasingh",
      email: "priya@annadata.com"
    }
  },
  {
    id: 3,
    name: "Vikram Patel",
    position: "Head of Farmer Relations",
    bio: "Born into a farming family, Vikram has deep understanding of agricultural practices and farmer needs. Leads our farmer outreach initiatives.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/vikrampatel",
      twitter: "https://twitter.com/vikrampatel",
      email: "vikram@annadata.com"
    }
  },
  {
    id: 4,
    name: "Ananya Reddy",
    position: "Chief Marketing Officer",
    bio: "Marketing executive with extensive experience in rural markets. Expert in building brands that resonate with diverse agricultural communities.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/ananyareddy",
      twitter: "https://twitter.com/ananyareddy",
      email: "ananya@annadata.com"
    }
  },
  {
    id: 5,
    name: "Arjun Mehta",
    position: "Chief Operations Officer",
    bio: "Logistics and supply chain expert focused on optimizing the flow of goods from farm to market. Previously worked with major food distribution networks.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/arjunmehta",
      twitter: "https://twitter.com/arjunmehta",
      email: "arjun@annadata.com"
    }
  },
  {
    id: 6,
    name: "Meera Joshi",
    position: "Head of Consumer Experience",
    bio: "Customer experience specialist with a background in retail and e-commerce. Dedicated to making fresh produce accessible to all consumers.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1398&auto=format&fit=crop",
    social: {
      linkedin: "https://linkedin.com/in/meerajoshi",
      twitter: "https://twitter.com/meerajoshi",
      email: "meera@annadata.com"
    }
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const TeamMember = ({ member }) => {
  return (
    <m.div variants={itemVariants}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden">
            <img 
              src={member.image} 
              alt={member.name}
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="p-5">
            <h3 className="font-bold text-xl mb-1">{member.name}</h3>
            <p className="text-[#138808] font-medium text-sm mb-3">{member.position}</p>
            <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
            <div className="flex space-x-3">
              <a 
                href={member.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#0077B5] transition-colors"
                aria-label={`LinkedIn profile of ${member.name}`}
              >
                <Linkedin size={18} />
              </a>
              <a 
                href={member.social.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#1DA1F2] transition-colors"
                aria-label={`Twitter profile of ${member.name}`}
              >
                <Twitter size={18} />
              </a>
              <a 
                href={`mailto:${member.social.email}`}
                className="text-gray-500 hover:text-[#D44638] transition-colors"
                aria-label={`Email ${member.name}`}
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
};

const TeamPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <m.div 
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Meet Our Team</h1>
        <p className="text-lg text-gray-600">
          Passionate professionals dedicated to transforming the agricultural ecosystem.
        </p>
      </m.div>

      <m.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {teamMembers.map((member) => (
          <TeamMember key={member.id} member={member} />
        ))}
      </m.div>

      <m.div 
        className="max-w-3xl mx-auto text-center bg-[#138808]/5 rounded-xl p-8 md:p-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Join Our Team</h2>
        <p className="text-gray-600 mb-6">
          We're always looking for talented individuals who are passionate about agriculture and technology.
          If you're interested in making a difference, we'd love to hear from you.
        </p>
        <Button className="bg-[#138808] hover:bg-[#0d6b06]">
          View Open Positions
        </Button>
      </m.div>
    </div>
  );
};

export default TeamPage;