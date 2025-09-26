"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Shield,
  Calculator,
  Star,
  Diamond,
  Crown,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is signed in, redirect to pricing
    if (isLoaded && user) {
      router.push("/pricing");
    }
  }, [user, isLoaded, router]);

  const features = [
    {
      icon: Calculator,
      title: "Numerology Readings",
      description:
        "Unlock the secrets hidden in your birth date and name through ancient numerological wisdom.",
    },
    {
      icon: Heart,
      title: "Love Compatibility",
      description:
        "Discover deep insights about your relationships and romantic compatibility with others.",
    },
    {
      icon: Shield,
      title: "Trust Assessment",
      description:
        "Evaluate trustworthiness and character traits through advanced psychological analysis.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description:
        "Get personalized insights powered by cutting-edge AI and psychological research.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "Lovelock helped me understand my partner better. The compatibility reading was spot-on!",
      rating: 5,
    },
    {
      name: "Michael R.",
      text: "The numerology readings are incredibly accurate. I'm amazed by what my birth date reveals.",
      rating: 5,
    },
    {
      name: "Jessica L.",
      text: "Trust assessments have been a game-changer for my business relationships.",
      rating: 5,
    },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white text-glow">
              Lovelock
            </span>
          </motion.div>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="glass">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="cosmic">Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">
                Unlock Hidden Secrets About Yourself and Others
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6 text-glow"
          >
            Discover Your
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Cosmic{" "}
            </span>
            Blueprint
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Master the art of reading people using ancient numerology and modern
            psychology. Predict behavior, understand relationships, and unlock
            personality patterns.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  variant="cosmic"
                  size="xl"
                  className="inline-flex items-center gap-2"
                >
                  Start Your Journey
                  <Sparkles className="w-5 h-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                variant="cosmic"
                size="xl"
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center gap-2"
              >
                Choose Your Plan
                <Crown className="w-5 h-5" />
              </Button>
            </SignedIn>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Used by 50,000+ people worldwide
              </p>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
                <span className="text-sm text-gray-300 ml-2">4.9/5</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-glow">
              Powerful Features for
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {" "}
                Self-Discovery
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to understand yourself and others on a deeper
              level
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="feature-item"
              >
                <Card className="glass border-white/10 bg-white/5 backdrop-blur-lg hover:transform hover:scale-105 transition-all duration-300 card-glow">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 className="text-4xl font-bold text-white mb-16 text-glow">
              Loved by Thousands
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Card className="glass border-white/10 bg-white/5 backdrop-blur-lg">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <CardDescription className="text-gray-300 mb-4 italic text-center">
                        &quot;{testimonial.text}&quot;
                      </CardDescription>
                      <p className="text-white font-semibold text-center">
                        {testimonial.name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="glass border-white/10 bg-white/5 backdrop-blur-lg p-12">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-4xl md:text-5xl font-bold text-white text-glow mb-6">
                  Ready to Unlock Your
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {" "}
                    Potential
                  </span>
                  ?
                </CardTitle>
                <CardDescription className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Join thousands of people who have discovered the secrets
                  hidden within their cosmic blueprint.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button
                      variant="cosmic"
                      size="xl"
                      className="inline-flex items-center gap-2 mb-4"
                    >
                      Begin Your Journey Today
                      <Zap className="w-5 h-5" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button
                    variant="cosmic"
                    size="xl"
                    onClick={() => router.push("/pricing")}
                    className="inline-flex items-center gap-2 mb-4"
                  >
                    Choose Your Plan
                    <Crown className="w-5 h-5" />
                  </Button>
                </SignedIn>

                <div className="mt-6 text-sm text-gray-400">
                  No credit card required • Start for free • Upgrade anytime
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
