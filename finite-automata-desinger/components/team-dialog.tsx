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
    name: "Mr. Pov Phannet",
    role: "Project Advisor",
    bio: "Researcher-Lecturer, IDRI, CADT",
    email: "phannet.pov@cadt.edu.kh",
  },
  {
    name: "Vorn Naratheany",
    role: "Full Stack Developer",
    bio: "I am studying for a Bachelor's degree in Computer Science, specializing in Software Engineering at CADT.",
    github: "TheanyVorn",
    email: "naratheany.vorn@student.cadt.edu.kh",
  },
  {
    name: "Soy Chanrotana",
    role: "Full Stack Developer",
    bio: "I am studying for a Bachelor's degree in Computer Science, specializing in Software Engineering at CADT.",
    github: "Zorina69",
    email: "chanrotana.soy@student.cadt.edu.kh",
  },
  {
    name: "Chetha Navid",
    role: "Full Stack Developer",
    bio: "I am studying for a Bachelor's degree in Computer Science, specializing in Software Engineering at CADT.",
    github: "ChethaNavid",
    email: "navid.chetha@student.cadt.edu.kh",
  },
  {
    name: "Khen Chandarapisey",
    role: "Full Stack Developer",
    bio: "I am studying for a Bachelor's degree in Computer Science, specializing in Software Engineering at CADT.",
    github: "SeYz-GHB",
    email: "chandarapisey.khen@student.cadt.edu.kh",
  },
  {
    name: "Vouen Samnang",
    role: "Team Leader",
    bio: "I am studying for a Bachelor's degree in Computer Science, specializing in Software Engineering at CADT.",
    github: "Samnang-Vouen",
    email: "samnang.vouen@student.cadt.edu.kh",
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
