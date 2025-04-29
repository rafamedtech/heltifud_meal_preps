export type WeeklyPlan = {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  button: {
    label: string;
    icon: string;
    click: () => void;
  };
};
