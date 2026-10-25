import { revalidatePath } from "next/cache";

export function revalidateWorkspace() {
  revalidatePath("/student", "layout");
  revalidatePath("/professor", "layout");
}
