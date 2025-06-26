
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageSquare, Linkedin, Github, Send, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for your message. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@interviewvoyage.com",
      color: "bg-blue-500",
      action: "Connect"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+91-9876543210",
      color: "bg-green-500",
      action: "Connect"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: "WhatsApp",
      color: "bg-green-500",
      action: "Connect"
    },
    {
      icon: Linkedin,
      title: "LinkedIn",
      value: "linkedin.com/in/interviewvoyage",
      color: "bg-blue-600",
      action: "Connect"
    },
    {
      icon: Github,
      title: "GitHub",
      value: "github.com/InterviewVoyage",
      color: "bg-gray-800",
      action: "Connect"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Have questions about InterviewVoyage? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 h-fit">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Fill out the form below and we'll get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Your Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-300">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`h-12 w-12 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{method.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{method.value}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Schedule a Call */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Schedule a Call</h3>
                <p className="text-slate-400 mb-6">
                  Let's discuss opportunities over a video call and explore how InterviewVoyage can help accelerate your career growth.
                </p>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  Start Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
