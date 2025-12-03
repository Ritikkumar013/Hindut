import React from "react";

const Privacy = () => {
  return (
    <>
            <div className='w-full h-[70vh] flex items-center bg-[url("/3.jpg")] bg-cover bg-center lg:h-[80vh]'>
                <div className="container flex flex-col items-start max-w-[1280px] mx-auto gap-[10px] text-white px-5 md:px-10 lg:mb-[-80px]">
                    <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                        Privacy Policy
                    </h1>
                </div>
            </div>
            {/* Section 2 */}
            <div className='bg-white text-sm  py-14'>
                <div className='max-w-screen-xl container mx-auto px-5 md:px-10'>
                    <h1 className='mb-3 text-3xl'>Welcome to Auto Bargain!</h1>
                    <p className='mb-8'>Thank you for choosing Auto Bargain, a premier platform dedicated to motorcycle enthusiasts around the globe. Your privacy is our top priority, and we are committed to safeguarding your personal information. This Privacy Policy explains how we collect, utilize, and protect your data when you interact with our website and services.</p>
                    <h3 className='text-xl mb-3'>Information We Collect:</h3>
                    <ul className='list-decimal ml-4 mb-8' >
                        <li>Personal Information: When you register with Auto Bargain, we may collect personal details such as your name, email address, phone number, and profile photo.</li>
                        <li>Location Information: To provide precise navigation features, we need access to your device’s location. This allows us to offer accurate route planning and location-specific services.</li>
                        <li>Media Access: Auto Bargain enables users to upload photos and videos. We may request access to your device’s gallery or camera for this purpose.</li>
                        <li>Usage Data: We gather information on how you use our platform, including browsing history, preferences, and interactions with other users.</li>
                        <li>Device Information: We may collect details about your device, such as its model, operating system, unique identifiers, and network information.</li>
                    </ul>
                    <h3 className='text-xl mb-3' >How We Use Your Information:</h3>
                    <ul className='list-decimal ml-4 mb-8' >
                        <li>Service Provision: We use your personal information to create and manage your Auto Bargain account, facilitate user communication, and deliver customized content and services.</li>
                        <li>Location-Based Features: Your location data helps us enhance your experience by providing accurate navigation, nearby points of interest, and tailored recommendations.</li>
                        <li>Content Sharing: Access to your device’s gallery allows you to upload and share images and videos within the Auto Bargain community.</li>
                        <li>Enhancing Experience: We analyze usage patterns and feedback to refine our platform, develop new features, and personalize content to better suit your preferences.</li>
                    </ul>
                    <h3 className='text-xl mb-3' >Data Sharing and Security:</h3>
                    <ul className='list-decimal ml-4 mb-8' >
                        <li>Third-Party Services: We may share your information with trusted third-party service providers who assist us in operating our services, including hosting providers, analytics partners, and payment processors.</li>
                        <li>Legal Requirements: We may disclose your information when required by law or in response to legal requests, such as subpoenas or court orders.</li>
                        <li>Data Protection: We implement industry-standard security measures to protect your data from unauthorized access and misuse. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.</li>                        
                    </ul>
                    <h3 className='text-xl mb-3' >Your Rights and Choices:</h3>
                    <ul className='list-decimal ml-4 mb-8' >
                        <li>Access and Updates: You can access and update your personal information through your Auto Bargain account settings.</li>
                        <li>Location and Media Permissions: Manage your permissions for location and media access through your device settings.</li>
                        <li>Marketing Preferences: You can opt-out of receiving promotional emails or messages from Auto Bargain by following the unsubscribe instructions included in the communications.</li>
                    </ul>
                    <p>Thank you for trusting Auto Bargain. If you have any questions about our Privacy Policy, feel free to contact us.</p>
                </div>
            </div>
        </>
  );
};

export default Privacy;
