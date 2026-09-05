import Window from "@/components/Window";
import Button from "@/components/Button";

export default function AvatarCreation() {
  return (
    <Window
      title="1. Create your avatar"
      footer={
        <div className="flex justify-between w-full">
          <Button label="Back" href="/" />
          <Button label="Next" href="/onboarding/select-prompt" />
        </div>
      }
    >
      JDAWd
    </Window>
  );
}
