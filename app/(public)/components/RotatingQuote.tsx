'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const quotes = [
    {
        language: 'English',
        text: 'A people without the knowledge of their past history, origin and culture is like a tree without roots.'
    },
    {
        language: 'Chinese',
        text: '一個不瞭解自己歷史、起源與文化的人，猶如一棵沒有根的樹。'
    },
    {
        language: 'Spanish',
        text: 'Un pueblo sin el conocimiento de su historia pasada, su origen y su cultura es como un árbol sin raíces.'
    },
    {
        language: 'Hindi',
        text: 'अपनी पिछली कहानी, उत्पत्ति और संस्कृति के ज्ञान के बिना लोग बिना जड़ों वाले पेड़ की तरह हैं।'
    },
    {
        language: 'Arabic',
        text: 'شعب لا يعرف تاريخه الماضي وأصله وثقافته مثل شجرة بلا جذور。'
    },
    {
        language: 'French',
        text: 'Un peuple qui ne connaît pas son passé, ses origines et sa culture est comme un arbre sans racines.'
    },
    {
        language: 'Bengali',
        text: 'অতীত ইতিহাস, উৎস এবং সংস্কৃতি সম্পর্কে জ্ঞানহীন জাতি শিকড়হীন গাছের মতো।'
    },
    {
        language: 'Portuguese',
        text: 'Um povo sem o conhecimento da sua história passada, origem e cultura é como uma árvore sem raízes.'
    },
    {
        language: 'Russian',
        text: 'Народ, не знающий своего прошлого, своего происхождения и своей культуры, подобен дереву без корней.'
    },
    {
        language: 'Urdu',
        text: 'وہ قوم جو اپنی ماضی کی تاریخ، اصل اور ثقافت سے واقف نہیں ہے، وہ بغیر جڑوں کے درخت کی طرح ہے۔'
    }
];

export default function RotatingQuote() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[120px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <div className="text-xl md:text-2xl font-serif italic text-foreground tracking-tight leading-relaxed">
                        "{quotes[currentIndex].text}"
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="mt-4 text-xs font-sans uppercase tracking-widest text-muted-foreground"
                    >
                        {quotes[currentIndex].language}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
