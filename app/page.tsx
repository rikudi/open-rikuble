"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Import shared components for the loading state
import { HeaderProvider } from "@/components/shared/header/HeaderContext";
import HeaderBrandKit from "@/components/shared/header/BrandKit/BrandKit";
import HeaderWrapper from "@/components/shared/header/Wrapper/Wrapper";
import HeaderDropdownWrapper from "@/components/shared/header/Dropdown/Wrapper/Wrapper";
import GithubIcon from "@/components/shared/header/Github/_svg/GithubIcon";
import ButtonUI from "@/components/ui/shadcn/button";
import { BookOpen } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to education page immediately
    router.replace('/education');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <HeaderProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <HeaderDropdownWrapper />

        <div className="sticky top-0 left-0 w-full z-[101] bg-white border-b border-gray-200">
          <HeaderWrapper>
            <div className="max-w-[900px] mx-auto w-full flex justify-between items-center">
              <div className="flex gap-24 items-center">
                <HeaderBrandKit />
              </div>
              <div className="flex gap-8">
                <a
                  className="contents"
                  href="https://github.com/mendableai/open-lovable"
                  target="_blank"
                >
                  <ButtonUI variant="tertiary">
                    <GithubIcon />
                    Use this Template
                  </ButtonUI>
                </a>
              </div>
            </div>
          </HeaderWrapper>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <BookOpen className="w-full h-full text-blue-600" />
                <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full animate-ping" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">KoulutusBot</h1>
              <p className="text-lg text-gray-600 mb-4">Suomen opetussisällön AI-generaattori</p>
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              <p>Siirretään KoulutusBotiin...</p>
              <p>Luo interaktiivista opetussisältöä tekoälyn avulla</p>
            </div>

            {/* Manual link as fallback */}
            <div className="mt-8">
              <Link
                href="/education"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Siirry KoulutusBotiin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HeaderProvider>
  );
}