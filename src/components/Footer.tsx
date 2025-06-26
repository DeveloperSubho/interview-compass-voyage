
import { Code, Github, Linkedin, User } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Interview Questions", href: "/questions" },
        { label: "Projects", href: "/projects" },
        { label: "System Design", href: "/system-design" },
        { label: "Tutorials", href: "/tutorials" }
      ]
    },
    {
      title: "Categories",
      links: [
        { label: "Java", href: "/java" },
        { label: "Spring Boot", href: "/spring-boot" },
        { label: "ReactJS", href: "/reactjs" },
        { label: "System Design", href: "/system-design" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" }
      ]
    }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">InterviewVoyage</span>
            </div>
            <p className="text-slate-400 text-sm">
              Your ultimate destination for mastering technical interviews and advancing your career in technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <User className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-white font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 InterviewVoyage. All rights reserved. Built with ❤️ for developers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
