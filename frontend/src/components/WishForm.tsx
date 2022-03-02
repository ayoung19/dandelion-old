import React, { FC, Dispatch, SetStateAction } from "react";
import { Formik } from "formik";
import {
  EuiButton,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalFooter,
  EuiButtonEmpty,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { Wish } from "../store/types";
import { useAuthFetch } from "../utils";

interface WishFormProps {
  initialValues: Partial<Wish>;
  setEditing: Dispatch<SetStateAction<Partial<Wish> | undefined>>;
}

export const WishForm: FC<WishFormProps> = ({ initialValues, setEditing }) => {
  const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });
  const AuthFetch = useAuthFetch();

  const closeModal = () => {
    setEditing(undefined);
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async ({ id, ...rest }) => {
        console.log({ id, ...rest });
        const status = id
          ? await AuthFetch("PUT", `/api/wishes/${id}`, JSON.stringify(rest))
          : await AuthFetch("POST", "/api/wishes", JSON.stringify(rest));

        if (status) {
          closeModal();
        }
      }}
    >
      {({ values, handleChange, handleSubmit }) => (
        <EuiModal onClose={closeModal} initialFocus="[name=url]">
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>Edit Wish</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiForm id={modalFormId} component="form" onSubmit={handleSubmit}>
              <EuiFormRow label="URL">
                <EuiFieldText
                  name="url"
                  onChange={handleChange}
                  value={values.url}
                />
              </EuiFormRow>
            </EuiForm>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
            <EuiButton fill type="submit" form={modalFormId}>
              Save
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
    </Formik>
  );
};
