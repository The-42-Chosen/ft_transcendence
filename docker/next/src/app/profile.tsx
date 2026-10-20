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
        <img
          src={avatarUrl ?? "/default-avatar.png"}
          alt={`${username} avatar`}
          className="h-20 w-20 rounded-full object-cover"
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