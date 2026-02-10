import { motion } from 'framer-motion';

export const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.5 }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const MotionWrapper = ({ children, className, delay = 0, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }} // Custom cubic bezier for "premium" feel
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default MotionWrapper;
