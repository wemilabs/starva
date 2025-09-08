import { Mail, SendHorizonal } from "lucide-react";
import { Button } from "./ui/button";
import { TextEffect } from "./text-effect";
import { AnimatedGroup } from "./animated-group";

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
    <section className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-orange-600)]">
      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:pt-30">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            per="word"
            className="text-balance text-2xl sm:text-4xl font-semibold md:text-5xl tracking-tight"
            highlightWords={["Bon", "appétit."]}
            highlightWrapperAs="span"
          >
            Search. Order. Bon appétit. 😋
          </TextEffect>
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="mx-auto mt-6 max-w-2xl text-pretty text-sm md:text-lg text-muted-foreground"
          >
            WhatsApp groups and their hellish notifications are such a cluncky
            mess, either looking for something to eat or promote your restaurant
            business. Enters Starva to solve this.
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
