import React from 'react'

interface suggestion {
    type: "good" | "improve";
    tip: string;
}

interface ATSProps {
    score: number;
    suggestions: suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {

    const gradientClass = score > 69
    ? 'from-green-100'
        : score > 49
    ? 'from-yellow-100'
        : 'from-red-100';


    //Determine icon based on score
    const iconSrc= score > 69
        ? '/icons/ats-warning.svg'
            : score > 49
    ? '/icons/ats-warning.svg'
        : '/icons/ats-bad.svg';

    //Determine subtitle based on score
    const subtitle = score > 69
    ? 'great-Job!'
        : score > 49
    ? 'Good Start'
            : 'Needs Improvement';
    return (
        <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full  `}>
            {/* Top Section with icon and Headline*/}

            <div className=" flex items-center gap-4 mb-6">
                <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
                <div>
                    <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
                </div>
            </div>


            {/* Description section */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
                <p className="text-gray-600 mb-4">
                    This score represents how well your resume
                </p>

                {/* Suggection List */}

                <div className="space-y-3">
                    {suggesion.map((suggesion, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <img
                                src={suggetion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                                alt={suggesion.type === "good" ? "Check" : "Warning"}
                                className="w-5 h-5 mt-1"
                            />
                            <p className={ suggesion.type === "good" ? "text-green-700" : "text-amber-700"}>
                                {suggesion.tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/*Closing encouragement*/}
            <p className="text-gray-700 italic">
                Keep refining your resume to improve your change of getting past ATS filters and into the hands of recruiters.
            </p>
        </div>
    )
}

export default ATS;
