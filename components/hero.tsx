import Image from "next/image";
import { Suspense } from "react";
import { AnimatedGroup } from "./animated-group";
import { SearchForm } from "./forms/search-form";
import { TextEffect } from "./text-effect";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export async function Hero() {
  "use cache";
  return (
    <section className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-orange-600)] rounded-lg">
      <div className="relative mx-auto max-w-full px-6 py-20 lg:pt-30">
        <Image
          src="https://hsl8jk540a.ufs.sh/f/JFF4Q8WebB6dz7JnPyW2kz06ogjwmFnOXWGv2lN4VS7CTLua"
          alt="Pre-prepared food showcasing ready-eat delicious meals"
          width={1000}
          height={1000}
          className="absolute top-0 left-0 w-full h-full object-cover"
          priority
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/50" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            per="word"
            className="text-balance text-2xl sm:text-4xl font-semibold md:text-5xl tracking-tight text-primary-foreground"
            highlightWords={["Bon", "appétit"]}
            highlightWrapperAs="span"
          >
            Search. Order. Bon appétit 😋
          </TextEffect>
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="mx-auto mt-6 max-w-2xl text-pretty text-xs md:text-sm text-primary-foreground"
          >
            WhatsApp groups and their hellish notifications: such a maddening
            experience. Either looking for something to eat or promote your
            restaurant business. Fortunately, enters Starva solving it.
          </TextEffect>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-12"
          >
            <Suspense fallback={<div className="h-10 md:h-12" />}>
              <SearchForm
                formProps={{ className: "mx-auto max-w-lg" }}
                inputFieldOnlyClassName="h-10 md:h-12"
                controlledAutoFocus
                placeholder="eg. vosgienne, odika, pizza, etc."
              />
            </Suspense>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
