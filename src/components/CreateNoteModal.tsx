import { useUser } from "@clerk/nextjs";
import { Dialog, Transition } from "@headlessui/react";
import { type Note } from "@prisma/client";
import dayjs from "dayjs";
import { Fragment } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { v4 } from "uuid";

type CreateNoteFormInputs = {
  content: string;
};

export const CreateNoteModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user } = useUser();
  const ctx = api.useContext();
  const { register, handleSubmit, reset } = useForm<CreateNoteFormInputs>();

  const { mutate: createNote } = api.note.create.useMutation({
    onMutate: async (note) => {
      await ctx.note.getAll.cancel();

      const previousNotes = ctx.note.getAll.getData();

      const newNote: Note = {
        user_id: user?.id ?? "",
        content: note.content,
        created_at: dayjs().toDate(),
        updated_at: dayjs().toDate(),
        id: v4(),
      };

      ctx.note.getAll.setData(undefined, (oldNotes) =>
        oldNotes ? [...oldNotes, newNote] : [newNote]
      );

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(undefined, context?.previousNotes ?? []);

      toast.error("There was an error creating your note :(");
      console.error("Error creating note: ", err);
    },

    onSettled: () => {
      void ctx.note.getAll.invalidate();
    },
  });

  const onSubmit: SubmitHandler<CreateNoteFormInputs> = ({ content }) => {
    createNote({ content });

    onClose();
    reset();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as="form"
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create note
                </Dialog.Title>

                <div className="mt-2">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Add your comment
                  </label>

                  <div className="mt-2">
                    <textarea
                      {...register("content")}
                      rows={4}
                      id="content"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <button
                    type="submit"
                    className="ml-auto inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                  >
                    Create
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
