"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Github, Linkedin, Mail } from "lucide-react"

interface TeamMember {
  name: string
  role: string
  bio: string
  avatar?: string
  github?: string
  linkedin?: string
  email?: string
}

const teamMembers: TeamMember[] = [
  {
    name: "Alex Johnson",
    role: "Lead Developer",
    bio: "Full-stack developer with expertise in React, TypeScript, and automata theory. Passionate about creating intuitive educational tools for computer science concepts.",
    github: "alexjohnson",
    linkedin: "alex-johnson-dev",
    email: "alex@example.com",
  },
  {
    name: "Sarah Chen",
    role: "UI/UX Designer",
    bio: "Designer focused on creating accessible and user-friendly interfaces. Specializes in educational technology and interactive visualizations.",
    linkedin: "sarah-chen-design",
    email: "sarah@example.com",
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Computer Science Advisor",
    bio: "Professor of Computer Science with 15+ years of experience in formal languages and automata theory. Provides academic guidance and theoretical expertise.",
    email: "mrodriguez@university.edu",
  },
  {
    name: "Emma Thompson",
    role: "Frontend Developer",
    bio: "React specialist with a passion for interactive data visualization. Contributed to the graph rendering and animation features using Cytoscape.js.",
    github: "emmathompson",
    linkedin: "emma-thompson-dev",
  },
]

export function TeamDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Our Team
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Meet Our Team</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Avatar placeholder */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>

                  {/* Social Links */}
                  <div className="flex space-x-3 pt-2">
                    {member.github && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {member.linkedin && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://linkedin.com/in/${member.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {member.email && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${member.email}`}>
                          <Mail className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            This project was created as part of our commitment to making computer science education more accessible and
            interactive.
          </p>
          <p className="mt-2">Built with React, TypeScript, Next.js, and Cytoscape.js</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
