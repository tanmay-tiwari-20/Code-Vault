"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Github,
  Star,
  GitFork,
  ExternalLink,
  Sun,
  Moon,
  Code2,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Zap,
  Rocket,
  MapPin,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const CodeVault = () => {
  const [username, setUsername] = useState("");
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [languageStats, setLanguageStats] = useState([]);
  const [error, setError] = useState("");
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  const languageColors = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Java: "#ed8b00",
    "C++": "#00599c",
    C: "#555555",
    HTML: "#e34c26",
    CSS: "#1572b6",
    React: "#61dafb",
    Vue: "#4fc08d",
    Go: "#00add8",
    Rust: "#dea584",
    PHP: "#777bb4",
    Ruby: "#cc342d",
    Swift: "#fa7343",
    Kotlin: "#7f52ff",
    Dart: "#0175c2",
    Shell: "#89e051",
  };

  const fetchUserData = async (user) => {
    try {
      setLoading(true);
      setError("");

      // Proxy options
      const proxies = [
        "https://corsproxy.io/?",
        "https://cors-anywhere.herokuapp.com/",
        "https://api.allorigins.win/raw?url=",
      ];

      let userData = null;
      let reposData = null;

      // Try different proxies until one works
      for (let i = 0; i < proxies.length; i++) {
        try {
          const proxyUrl = proxies[i];

          // Fetch user info
          const userUrl =
            proxyUrl +
            encodeURIComponent(`https://api.github.com/users/${user}`);
          const userResponse = await fetch(userUrl);

          if (userResponse.ok) {
            userData = await userResponse.json();

            // Fetch repositories
            const reposUrl =
              proxyUrl +
              encodeURIComponent(
                `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
              );
            const reposResponse = await fetch(reposUrl);

            if (reposResponse.ok) {
              reposData = await reposResponse.json();
              break;
            }
          } else if (userResponse.status === 404) {
            throw new Error("User not found");
          }
        } catch (proxyError) {
          console.log(`Proxy ${i + 1} failed:`, proxyError);

          if (i === proxies.length - 1) {
            try {
              const directUserResponse = await fetch(
                `https://api.github.com/users/${user}`
              );
              if (directUserResponse.ok) {
                userData = await directUserResponse.json();
                const directReposResponse = await fetch(
                  `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
                );
                if (directReposResponse.ok) {
                  reposData = await directReposResponse.json();
                }
              } else if (directUserResponse.status === 404) {
                throw new Error("User not found");
              }
            } catch (directError) {
              throw new Error(
                "Unable to fetch data. This might be due to CORS restrictions."
              );
            }
          }
        }
      }

      if (!userData || !reposData) {
        throw new Error("Failed to fetch GitHub data");
      }

      setUserStats(userData);
      setRepositories(reposData);
      setFilteredRepos(reposData);

      // Calculate language stats
      const langCount = {};
      reposData.forEach((repo) => {
        if (repo.language) {
          langCount[repo.language] = (langCount[repo.language] || 0) + 1;
        }
      });

      const langStats = Object.entries(langCount)
        .map(([name, value]) => ({
          name,
          value,
          color: languageColors[name] || "#64748b",
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      setLanguageStats(langStats);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.message.includes("User not found")) {
        setError(
          "GitHub user not found. Please check the username and try again."
        );
      } else if (err.message.includes("CORS")) {
        setError(
          "CORS error: Try running this app on a local server or deploy it to work around browser restrictions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (username.trim()) {
      fetchUserData(username.trim());
    }
  };

  useEffect(() => {
    let filtered = repositories;

    if (searchTerm) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description &&
            repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((repo) => repo.language === selectedLanguage);
    }

    setFilteredRepos(filtered);
  }, [searchTerm, selectedLanguage, repositories]);

  const uniqueLanguages = [
    ...new Set(repositories.map((repo) => repo.language).filter(Boolean)),
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const RepoCard = ({ repo, index }) => (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      custom={index}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl ${
        darkMode
          ? "bg-gray-900/30 border-gray-700/50 hover:bg-gray-800/40"
          : "bg-white/30 border-gray-200/50 hover:bg-white/50"
      }`}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500 rounded-full"
            initial={{ x: Math.random() * 300, y: 300, opacity: 0 }}
            animate={{
              y: -50,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative p-8">
        <motion.div
          className="flex items-start justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Code2 className="w-5 h-5 text-white" />
            </motion.div>
            <h3
              className={`font-bold text-lg truncate ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {repo.name}
            </h3>
          </div>
          <motion.a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl transition-all duration-300 ${
              darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"
            }`}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>

        <motion.p
          className={`text-sm mb-6 line-clamp-2 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {repo.description || "No description available"}
        </motion.p>

        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <div className="flex items-center space-x-6">
            {repo.language && (
              <motion.span
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: languageColors[repo.language] || "#64748b",
                  }}
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {repo.language}
                </span>
              </motion.span>
            )}
            <motion.span
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-yellow-500" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {repo.stargazers_count}
              </span>
            </motion.span>
            <motion.span
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <GitFork className="w-4 h-4 text-blue-500" />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {repo.forks_count}
              </span>
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50"
      }`}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${
          darkMode
            ? "bg-black/10 border-gray-800/50"
            : "bg-white/10 border-gray-200/50"
        }`}
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Github className="w-6 h-6 text-white" />
              </motion.div>
              <span
                className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}
              >
                CodeVault
              </span>
            </motion.div>
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                darkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-100/50"
              }`}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-6 h-6 text-indigo-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          style={{ y: backgroundY }}
        />
        <div className="relative max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl"
                />
                <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              className={`text-6xl md:text-7xl font-bold mb-8 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Showcase Your
              <motion.span
                className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Code Journey
              </motion.span>
            </motion.h1>

            <motion.p
              className={`text-xl mb-12 max-w-3xl mx-auto leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Transform your GitHub profile into a stunning, interactive
              portfolio that captivates recruiters and showcases your
              development expertise like never before.
            </motion.p>
          </motion.div>

          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 rounded-2xl border p-4 sm:p-3 backdrop-blur-2xl shadow-2xl w-full ${
                darkMode
                  ? "bg-gray-900/20 border-gray-700/30"
                  : "bg-white/20 border-gray-200/30"
              }`}
            >
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className={`flex-1 px-4 py-3 sm:py-4 bg-transparent border-none outline-none text-base sm:text-lg rounded-xl ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-900 placeholder-gray-500"
                }`}
              />
              <motion.button
                onClick={handleSearch}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Loading...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="explore"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Rocket className="w-5 h-5" />
                      <span>Explore</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            ></motion.div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div
                  className={`p-6 rounded-2xl border backdrop-blur-xl ${
                    darkMode
                      ? "bg-red-900/20 border-red-500/30 text-red-300"
                      : "bg-red-50/50 border-red-200/50 text-red-600"
                  }`}
                >
                  <p className="font-semibold mb-2">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* User Profile + Stats Section Combined  */}
      <AnimatePresence>
        {userStats && (
          <motion.section
            className="max-w-7xl mx-auto px-6 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
              {/* User Profile Card - 1 Column */}
              <motion.div
                className={`col-span-1 p-8 rounded-2xl border backdrop-blur-md shadow-lg ${
                  darkMode
                    ? "bg-gray-800/40 border-gray-700"
                    : "bg-white/60 border-gray-200"
                } hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <motion.img
                    src={userStats.avatar_url}
                    alt={userStats.name || userStats.login}
                    className="w-32 h-32 rounded-full mb-6 border-4 border-white dark:border-gray-700 shadow-md"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    whileHover={{ scale: 1.1 }}
                  />

                  {/* Name */}
                  <motion.h2
                    className={`text-2xl font-semibold tracking-tight mb-1 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {userStats.name || userStats.login}
                  </motion.h2>

                  {/* Username */}
                  <motion.p
                    className={`text-sm font-medium mb-4 ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    @{userStats.login}
                  </motion.p>

                  {/* Bio */}
                  {userStats.bio && (
                    <motion.p
                      className={`text-sm mb-6 leading-relaxed max-w-xs ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {userStats.bio}
                    </motion.p>
                  )}

                  {/* Location */}
                  {userStats.location && (
                    <motion.div
                      className={`flex items-center gap-2 mb-4 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-700"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{userStats.location}</span>
                    </motion.div>
                  )}

                  {/* Blog/Website */}
                  {userStats.blog && (
                    <motion.a
                      href={
                        userStats.blog.startsWith("http")
                          ? userStats.blog
                          : `https://${userStats.blog}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 text-sm font-medium hover:underline ${
                        darkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-500"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Website</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>

              {/* Stats - 3 Columns */}
              <motion.div
                className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  {
                    icon: Users,
                    value: userStats.followers,
                    label: "Followers",
                    color: "text-blue-500",
                    gradient: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Code2,
                    value: userStats.public_repos,
                    label: "Repositories",
                    color: "text-green-500",
                    gradient: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: TrendingUp,
                    value: userStats.following,
                    label: "Following",
                    color: "text-purple-500",
                    gradient: "from-purple-500 to-pink-500",
                  },
                  {
                    icon: Calendar,
                    value: new Date(userStats.created_at).getFullYear(),
                    label: "Joined",
                    color: "text-orange-500",
                    gradient: "from-orange-500 to-red-500",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className={`p-8 rounded-2xl border backdrop-blur-xl ${
                      darkMode
                        ? "bg-gray-900/30 border-gray-700/50"
                        : "bg-white/30 border-gray-200/50"
                    } hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient}`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <stat.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div>
                        <motion.p
                          className={`text-3xl font-bold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: index * 0.1 + 0.3,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          {stat.value.toLocaleString()}
                        </motion.p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Language Chart */}
      <AnimatePresence>
        {languageStats.length > 0 && (
          <motion.section
            className="max-w-7xl mx-auto px-6 py-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className={`text-4xl font-bold text-center mb-16 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Language Analytics
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                className={`p-10 rounded-3xl border backdrop-blur-xl ${
                  darkMode
                    ? "bg-gray-900/30 border-gray-700/50"
                    : "bg-white/30 border-gray-200/50"
                } hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-2xl font-bold mb-8 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Language Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {languageStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#ffffff" : "#ffffff",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                className={`p-10 rounded-3xl border backdrop-blur-xl ${
                  darkMode
                    ? "bg-gray-900/30 border-gray-700/50"
                    : "bg-white/30 border-gray-200/50"
                } hover:shadow-2xl transition-all duration-500`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3
                  className={`text-2xl font-bold mb-8 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Repository Count by Language
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languageStats}>
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: darkMode ? "#9ca3af" : "#6b7280",
                          fontSize: 12,
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#1f2937" : "#1f2937",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#barGradient)"
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Filters */}
      <AnimatePresence>
        {repositories.length > 0 && (
          <motion.section
            className="max-w-7xl mx-auto px-6 py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <motion.div
                className="flex-1 relative max-w-md"
                whileHover={{ scale: 1.02 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-6 py-4 rounded-2xl border backdrop-blur-xl ${
                    darkMode
                      ? "bg-gray-900/30 border-gray-700/50 text-white placeholder-gray-400"
                      : "bg-white/30 border-gray-200/50 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                />
              </motion.div>

              <div className="flex items-center space-x-6">
                <motion.select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`px-6 py-4 rounded-2xl border backdrop-blur-xl ${
                    darkMode
                      ? "bg-gray-900/30 border-gray-700/50 text-white"
                      : "bg-white/30 border-gray-200/50 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300`}
                  whileHover={{ scale: 1.02 }}
                >
                  <option value="all">All Languages</option>
                  {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </motion.select>

                <motion.span
                  className={`text-sm font-medium px-4 py-2 rounded-xl ${
                    darkMode
                      ? "bg-gray-800/50 text-gray-300"
                      : "bg-gray-100/50 text-gray-600"
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={filteredRepos.length}
                >
                  {filteredRepos.length} repositories
                </motion.span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Repository Grid */}
      <AnimatePresence>
        {filteredRepos.length > 0 && (
          <motion.section
            className="max-w-7xl mx-auto px-6 pb-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredRepos.map((repo, index) => (
                <RepoCard key={repo.id} repo={repo} index={index} />
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        className={`border-t backdrop-blur-xl ${
          darkMode
            ? "bg-gray-900/20 border-gray-700/50"
            : "bg-white/20 border-gray-200/50"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <motion.div
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.1 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Github className="w-6 h-6 text-white" />
                </motion.div>
                <span
                  className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}
                >
                  CodeVault
                </span>
              </div>
            </motion.div>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Transforming GitHub profiles into stunning portfolios
            </p>
          </div>
        </div>
      </motion.footer>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CodeVault;
