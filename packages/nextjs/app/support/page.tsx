"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NextPage } from "next";
import { EnvelopeIcon, LifebuoyIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Island from "~~/components/ui/island";

const SupportPage: NextPage = () => {
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  const faqsData = [
    {
      question: "Why was my payment declined?",
      answer:
        "Payments can be declined due to insufficient funds, incorrect card details, or security checks by your bank.",
    },
    {
      question: "How long do refunds take?",
      answer: "Refunds typically take 5-7 business days to process, depending on your bank.",
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and never store your full card details.",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[#111] text-white py-16 px-4 sm:px-6 lg:px-8"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <Island />
      <div className="max-w-4xl mx-auto">
        <motion.div variants={item} className="flex flex-col items-center text-center mb-16">
          <LifebuoyIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We&apos;re here to assist you with any payment issues or questions you might have.
          </p>
        </motion.div>

        <motion.div variants={stagger} className="grid md:grid-cols-2 gap-8">
          {/* Contact Us */}
          <motion.div
            variants={item}
            className="bg-[#222] rounded-xl p-8 border border-zinc-700 hover:border-blue-500 transition-all flex flex-col justify-between items-start"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center mb-6 justify-center">
              <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                <EnvelopeIcon className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold">Email Support</h2>
            </div>
            <p className="text-gray-400 !mb-6">Send us an email and we&apos;ll get back to you within 24 hours.</p>
            <Link
              href="mailto:support@lyra.com"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Contact via Email
            </Link>
          </motion.div>

          {/* Live Support */}
          <motion.div
            variants={item}
            className="bg-[#222] rounded-xl p-8 border border-zinc-700 hover:border-green-500 transition-all flex flex-col justify-between items-start"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center mb-6 justify-center">
              <div className="bg-green-500/20 p-3 rounded-full mr-4">
                <PhoneIcon className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Live Support</h2>
            </div>
            <p className="text-gray-400 !mb-6">Available Monday to Friday, 9AM to 5PM.</p>
            <a
              href="tel:+60-188888888"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Call +60 (018) 888-8888
            </a>
          </motion.div>
        </motion.div>

        {/* FAQs Section */}
        <motion.div variants={item} className="mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions (FAQs)</h2>
          <div className="space-y-4">
            {faqsData.map((faq, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-[#222] rounded-lg p-6 border border-zinc-700"
                whileHover={{ x: 5 }}
              >
                <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupportPage;
