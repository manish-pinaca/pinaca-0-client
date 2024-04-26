/* eslint-disable @typescript-eslint/no-explicit-any */
interface CardProps {
  Icon: any;
  value: number;
  label: string;
}

const Card = ({ Icon, value, label }: CardProps) => {
  return (
    <>
      <div className="lg:w-[30%] h-[100px] h-full flex gap-4 items-center rounded-md bg-white py-2 px-4 cursor-not-allowed">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex justify-center items-center">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-4xl font-medium">{value}</p>
          <p className="text-gray-500 text-sm">{label}</p>
        </div>
      </div>
    </>
  );
};

export default Card;
