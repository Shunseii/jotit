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
import {
  type GetAllNotesInput,
  isCapturingInputAtom,
  isTypeHotkeyEnabledAtom,
  slideoverInputAtom,
  noteMutationQueuesAtom,
} from "~/pages/app";
import { searchInputAtom } from "./Layout";
import { MutationQueue } from "~/utils/queue";

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
  const [slideoverInput] = useAtom(slideoverInputAtom);
  const [searchInput] = useAtom(searchInputAtom);
  const [, setIsCapturingInput] = useAtom(isCapturingInputAtom);
  const [, setNoteMutationQueues] = useAtom(noteMutationQueuesAtom);
  const { user } = useUser();
  const [, setIsTypeHotkeyEnabled] = useAtom(isTypeHotkeyEnabledAtom);
  const ctx = api.useContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<CreateNoteFormInputs>({
    defaultValues: { content: slideoverInput ?? defaultNote?.content ?? "" },
  });

  const isTextareaFocused = isDirty || isSubmitting;

  useEffect(() => {
    setValue("content", slideoverInput ?? "");
  }, [slideoverInput, setValue]);

  useEffect(() => {
    setValue("content", defaultNote?.content ?? "");
  }, [defaultNote, setValue]);

  useEffect(() => {
    setIsCapturingInput(!isTextareaFocused);
  }, [isTextareaFocused, setIsCapturingInput]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsTypeHotkeyEnabled(false);
    }
  }, [isOpen, reset, setIsTypeHotkeyEnabled]);

  const getAllNotesQueryInputs: GetAllNotesInput = {
    searchKeyword: searchInput || undefined,
  };

  const { mutateAsync: editNote } = api.note.edit.useMutation({
    onMutate: async () => {
      await ctx.note.getAll.cancel();

      // TODO: use correct previous state
      const previousNotes = ctx.note.getAll.getData(getAllNotesQueryInputs);

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(
        getAllNotesQueryInputs,
        context?.previousNotes ?? []
      );

      toast.error("There was an error creating your note :(");
      console.error("Error creating note: ", err);

      void ctx.note.getAll.invalidate();
    },
  });

  const { mutateAsync: createNote } = api.note.create.useMutation({
    onMutate: async () => {
      await ctx.note.getAll.cancel();

      // TODO: use correct previous state
      const previousNotes = ctx.note.getAll.getData(getAllNotesQueryInputs);

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(
        getAllNotesQueryInputs,
        context?.previousNotes ?? []
      );

      toast.error("There was an error creating your note :(");
      console.error("Error creating note: ", err);

      void ctx.note.getAll.invalidate();
    },
  });

  const handleCreateNote = ({ content }: { content: string }) => {
    const newNote: Note = {
      userId: user?.id ?? "",
      content: content,
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
      renderId: v4(),
      id: v4(),
      deletedAt: null,
    };

    setNoteMutationQueues((draftMap) => {
      if (!draftMap.has(newNote.renderId)) {
        draftMap.set(newNote.renderId, new MutationQueue());
      }

      void draftMap.get(newNote.renderId)?.enqueue({
        apiCall: async () => {
          await createNote({
            content: newNote.content,
            renderId: newNote.renderId,
          });
        },
        optimisticUpdate: () => {
          const note = { ...newNote };

          ctx.note.getAll.setData(getAllNotesQueryInputs, (oldNotes) =>
            oldNotes ? [note, ...oldNotes] : [note]
          );
        },
        previousState: ctx.note.getAll.getData(
          getAllNotesQueryInputs
        ) as Note[],
      });
    });
  };

  const handleEditNote = ({
    content,
    id,
    renderId,
  }: {
    content: string;
    id: string;
    renderId: string;
  }) => {
    setNoteMutationQueues((draftMap) => {
      if (!draftMap.has(renderId)) {
        draftMap.set(renderId, new MutationQueue());
      }

      void draftMap.get(renderId)?.enqueue({
        apiCall: async () => {
          await editNote({ content, id, renderId });
        },
        optimisticUpdate: () => {
          ctx.note.getAll.setData(getAllNotesQueryInputs, (oldNotes) =>
            oldNotes?.map((oldNote) =>
              oldNote.renderId === renderId
                ? { ...oldNote, content: content }
                : oldNote
            )
          );
        },
        previousState: ctx.note.getAll.getData(
          getAllNotesQueryInputs
        ) as Note[],
      });
    });
  };

  const onSubmit: SubmitHandler<CreateNoteFormInputs> = ({ content }) => {
    if (defaultNote) {
      handleEditNote({
        content,
        id: defaultNote.id,
        renderId: defaultNote.renderId,
      });
    } else {
      handleCreateNote({ content });
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
