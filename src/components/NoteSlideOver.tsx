import { useUser } from "@clerk/nextjs";
import { Dialog, Transition } from "@headlessui/react";
import { type Note } from "@prisma/client";
import dayjs from "dayjs";
import { Fragment, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { v4 } from "uuid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useHotkeys } from "react-hotkeys-hook";
import { useAtom } from "jotai";
import { apiQueueAtom } from "~/pages/app";
import { Queue } from "~/utils/queue";

type CreateNoteFormInputs = {
  content: string;
};

export const NoteSlideOver = ({
  isOpen,
  defaultNote,
  onClose,
}: {
  isOpen: boolean;
  defaultNote: Note | null;
  onClose: () => void;
}) => {
  const [apiQueue, setApiQueue] = useAtom(apiQueueAtom);
  const { user } = useUser();
  const ctx = api.useContext();
  const { register, handleSubmit, reset, setValue } =
    useForm<CreateNoteFormInputs>({
      defaultValues: { content: defaultNote?.content ?? "" },
    });

  useEffect(() => {
    setValue("content", defaultNote?.content ?? "");
  }, [defaultNote, setValue]);

  const { mutate: editNote } = api.note.edit.useMutation({
    onMutate: async (note) => {
      await ctx.note.getAll.cancel();

      const previousNotes = ctx.note.getAll.getData();

      ctx.note.getAll.setData(undefined, (oldNotes) => {
        return (
          oldNotes?.map((oldNote) =>
            oldNote.id === note.id
              ? { ...oldNote, content: note.content }
              : oldNote
          ) ?? []
        );
      });

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

  const { mutate: createNote } = api.note.create.useMutation({
    onMutate: async (note) => {
      await ctx.note.getAll.cancel();

      const previousNotes = ctx.note.getAll.getData();

      const newNote: Note = {
        userId: user?.id ?? "",
        content: note.content,
        createdAt: dayjs().toDate(),
        updatedAt: dayjs().toDate(),
        renderId: note.renderId,
        id: v4(),
      };

      ctx.note.getAll.setData(undefined, (oldNotes) =>
        oldNotes ? [...oldNotes, newNote] : [newNote]
      );

      setApiQueue((draftMap) => {
        draftMap.set(note.renderId, new Queue());
      });

      return { previousNotes };
    },

    onError: (err, newNote, context) => {
      ctx.note.getAll.setData(undefined, context?.previousNotes ?? []);

      setApiQueue((draftMap) => {
        draftMap.delete(newNote.renderId);
      });

      toast.error("There was an error creating your note :(");
      console.error("Error creating note: ", err);
    },

    onSuccess: (note) => {
      const queue = apiQueue.get(note.renderId);

      if (queue) {
        while (!queue.isEmpty) {
          setApiQueue((draftMap) => {
            const apiCall = draftMap.get(note.renderId)?.dequeue();

            apiCall && apiCall(note);
          });
        }

        void ctx.note.getAll.invalidate();
      }

      setApiQueue((draftMap) => {
        draftMap.delete(note.renderId);
      });
    },
  });

  const handleEditNote = ({
    content,
    id,
    renderId,
  }: {
    content: string;
    id: string;
    renderId: string;
  }) => {
    if (apiQueue.has(id)) {
      setApiQueue((draftMap) => {
        const queue = draftMap.get(renderId);
        if (queue) {
          queue.enqueue(({ id, content }) => editNote({ content, id }));
        }
      });
    } else {
      editNote({ content, id });
    }
  };

  const onSubmit: SubmitHandler<CreateNoteFormInputs> = ({ content }) => {
    if (defaultNote) {
      handleEditNote({
        content,
        id: defaultNote.id,
        renderId: defaultNote.renderId,
      });
    } else {
      createNote({ content, renderId: v4() });
    }

    onClose();
    reset();
  };

  useHotkeys(
    "meta+s, ctrl+s",
    () => {
      if (isOpen) void handleSubmit(onSubmit)();
    },
    { preventDefault: true, enableOnFormTags: ["textarea"] }
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  as="form"
                  className="pointer-events-auto w-screen max-w-xl"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:divide-white/20 dark:bg-gray-900">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                      <div className="bg-indigo-700 px-4 py-6 dark:bg-indigo-500 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Jot down a note
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white dark:bg-indigo-500"
                              onClick={onClose}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-200">
                            {`Write a list of three things you're grateful for today and explain why they're important to you.`}
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <label
                          htmlFor="content"
                          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-50"
                        >
                          Write your note
                        </label>

                        <div className="mt-2">
                          <textarea
                            {...register("content")}
                            autoFocus
                            rows={15}
                            tabIndex={1}
                            id="content"
                            className="block w-full whitespace-pre-line rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 dark:bg-white/10 dark:text-white dark:ring-0 dark:hover:bg-white/20"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
