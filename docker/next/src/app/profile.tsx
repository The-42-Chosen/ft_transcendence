import Avatar from "@/app/components/User/Avatar";

type ProfileProps = {
  username: string;
  displayName?: string | null;
  email: string;
  avatarUrl?: string | null;
};

export default function Profile({
  username,
  displayName,
  email,
  avatarUrl,
}: ProfileProps) {
  return (
    <section className="w-full max-w-md rounded-xl border p-6 text-left">
      <div className="flex items-center gap-4">
        <Avatar
          username={username}
          avatarUrl={avatarUrl}
          size={80}
        />

        <div>
          <h2 className="text-2xl font-semibold">
            {displayName ?? username}
          </h2>

          <p className="text-sm text-gray-500">
            @{username}
          </p>

          <p className="text-sm">
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}