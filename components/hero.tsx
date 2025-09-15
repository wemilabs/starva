import { Mail, SendHorizonal } from "lucide-react";
import { AnimatedGroup } from "./animated-group";
import { TextEffect } from "./text-effect";
import { Button } from "./ui/button";
import Image from "next/image";

// TODO: Make the input form work

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

export function Hero() {
  return (
    <section className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-orange-600)] rounded-lg">
      <div className="relative mx-auto max-w-full px-6 py-20 lg:pt-30">
        <Image
          src="https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEImBqksMSp37LwhtgkreHYdqObMmJu5FG9zDis"
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
            <form action="" className="mx-auto max-w-sm">
              <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                <input
                  placeholder="Enter your email"
                  className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                  type="email"
                />

                <div className="md:pr-1.5 lg:pr-0">
                  <Button
                    aria-label="submit"
                    size="sm"
                    className="rounded-(--radius)"
                  >
                    <span className="hidden md:block">Get Started</span>
                    <SendHorizonal
                      className="relative mx-auto size-5 md:hidden"
                      strokeWidth={2}
                    />
                  </Button>
                </div>
              </div>
            </form>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
