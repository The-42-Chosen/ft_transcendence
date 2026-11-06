type AvatarProps = {
  username: string;
  avatarUrl?: string | null;
  size?: number;
};

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function getAvatarColor(username: string) {
  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash += username.charCodeAt(i);
  }

  return colors[hash % colors.length];
}

type AvatarProps = {
  username: string;
  avatarUrl: string | null;
  size?: number;
};

export default function Avatar({
  username,
  avatarUrl,
  size = 64,
}: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${username} avatar`}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gray-300 font-semibold"
      style={{
        width: size,
        height: size,
      }}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}