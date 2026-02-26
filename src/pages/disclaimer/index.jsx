import Layout from "@/components/Layout";

export default function DisclaimerPage() {
    return (
        <Layout title={"Disclaimer"} path={"disclaimer"}>
            <main className="max-w-4xl mx-auto p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Disclaimer</h1>

                <section className="space-y-4 text-gray-700 text-base md:text-lg">
                    <p>
                        The information provided on <strong>The Khabar Express</strong> is for general informational purposes only. All content on this platform—whether written by our team or submitted by users—reflects the views and opinions of the respective authors and not necessarily those of The Khabar Express.
                    </p>

                    <p>
                        While we strive to ensure the accuracy and reliability of the information shared, we make no guarantees of any kind regarding the completeness, accuracy, or reliability of any content. Any reliance you place on such information is strictly at your own risk.
                    </p>

                    <p>
                        The Khabar Express will not be liable for any losses or damages in connection with the use of our platform, including but not limited to direct, indirect, incidental, or consequential damages.
                    </p>

                    <p>
                        External links and third-party content may be included in blogs or community discussions. We do not have control over the content and nature of these sites and do not endorse any information or opinions found therein.
                    </p>

                    <p>
                        The content published by users remains their intellectual property. However, by submitting content to The Khabar Express, users grant us the right to display and distribute that content on our platform.
                    </p>

                    <p>
                        We reserve the right to remove or edit any content that violates our <a href="/privacy-policy" className="text-blue-600 hover:underline">Terms of Use</a>, community guidelines, or is deemed inappropriate.
                    </p>

                    <p>
                        By using our platform, you agree to this disclaimer and our other policies. If you do not agree, please refrain from using the website.
                    </p>
                </section>
            </main>
        </Layout>

    );
}
