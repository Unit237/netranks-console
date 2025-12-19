import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../../app/shared/ui/AppLogo";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled from top
      setIsScrolled(currentScrollY > 20);

      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Animation variants
  const navbarVariants: Variants = {
    visible: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    hidden: {
      y: -100,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const mobileMenuVariants: Variants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-hColor ${
        isScrolled
          ? "opacity-[#F1F1F1] bg-transparent backdrop-blur-md shadow-md border-b border-[#F1F1F1]"
          : "bg-white"
      }`}
      variants={navbarVariants}
      animate={isVisible ? "visible" : "hidden"}
      initial="visible"
    >
      <div className="w-full mx-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <AppLogo />
            </motion.div>

            {/* Desktop Actions */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`hidden md:flex items-center gap-3 ${
                isScrolled ? "backdrop-blur-sm" : "backdrop-blur-md"
              }`}
            >
              <button
                className="px-4 py-1.5 text-sm rounded-md border transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </button>

              <button
                className="px-4 py-1.5 text-sm rounded-md border transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                onClick={() => navigate("/signin")}
              >
                Sign up
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={`block md:hidden lg:block xl:hidden border-t transition-colors duration-300 ${
                isScrolled
                  ? "border-white/20 bg-black/50 backdrop-blur-md"
                  : "border-white/20 bg-black/50 backdrop-blur-md"
              }`}
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="px-3 xs:px-4 py-4 xs:py-5 sm:py-6 space-y-3 xs:space-y-4">
                <button
                  className="w-full rounded-md border px-4 py-2 text-sm bg-gray-100 dark:hover:bg-white/10"
                  onClick={() => {
                    navigate("/signin");
                    setIsOpen(false);
                  }}
                >
                  Sign in
                </button>

                <button
                  className="w-full rounded-md border px-4 py-2 text-sm bg-gray-100 dark:hover:bg-white/10"
                  onClick={() => {
                    navigate("/signin");
                    setIsOpen(false);
                  }}
                >
                  Sign up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Header;
