/* eslint-disable @typescript-eslint/no-explicit-any */
interface CardProps {
  Icon: any;
  value: number;
  label: string;
}

const Card = ({ Icon, value, label }: CardProps) => {
  return (
    <>
      <div className="lg:w-[30%] h-full flex gap-4 items-center rounded-md bg-white p-6 cursor-pointer">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex justify-center items-center">
          <Icon size={32} />
        </div>
        <div>
          <p className="text-5xl font-medium">{value}</p>
          <p className="text-gray-500 text-sm">{label}</p>
        </div>
      </div>
    </>
  );
};

export default Card;
