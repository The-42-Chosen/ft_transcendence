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

function getAvatarColor(username: string) {
  let sum = 0;

  for (const char of username) {
    sum += char.charCodeAt(0);
  }

  return colors[sum % colors.length];
}

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

  const avatarColor = getAvatarColor(username);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${avatarColor}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}