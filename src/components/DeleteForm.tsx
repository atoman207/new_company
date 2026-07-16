"use client";

type Props = {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
};

export default function DeleteForm({
  action,
  confirmMessage,
  className,
  children,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
