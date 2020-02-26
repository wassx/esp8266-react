import React from 'react';
import { withSnackbar, WithSnackbarProps } from 'notistack';

import { redirectingAuthorizedFetch } from '../authentication';

export interface RestControllerProps<D> extends WithSnackbarProps {
  handleValueChange: (name: keyof D) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (name: keyof D) => (event: React.ChangeEvent<{}>, value: number | number[]) => void;

  setData: (data: D) => void;
  saveData: () => void;
  loadData: () => void;

  data?: D;
  loading: boolean;
  errorMessage?: string;
}

interface RestControllerState<D> {
  data?: D;
  loading: boolean;
  errorMessage?: string;
}

const extractValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  switch (event.target.type) {
    case "number":
      return event.target.valueAsNumber;
    case "checkbox":
      return event.target.checked;
    default:
      return event.target.value
  }
}

export function restController<D, P extends RestControllerProps<D>>(endpointUrl: string, RestController: React.ComponentType<P & RestControllerProps<D>>) {
  return withSnackbar(
    class extends React.Component<Omit<P, keyof RestControllerProps<D>> & WithSnackbarProps, RestControllerState<D>> {

      state: RestControllerState<D> = {
        data: undefined,
        loading: false,
        errorMessage: undefined
      };

      setData = (data: D) => {
        this.setState({
          data,
          loading: false,
          errorMessage: undefined
        });
      }

      loadData = () => {
        this.setState({
          data: undefined,
          loading: true,
          errorMessage: undefined
        });
        redirectingAuthorizedFetch(endpointUrl).then(response => {
          if (response.status === 200) {
            return response.json();
          }
          throw Error("Invalid status code: " + response.status);
        }).then(json => {
          this.setState({ data: json, loading: false })
        }).catch(error => {
          const errorMessage = error.message || "Unknown error";
          this.props.enqueueSnackbar("Problem fetching: " + errorMessage, { variant: 'error' });
          this.setState({ data: undefined, loading: false, errorMessage });
        });
      }

      saveData = () => {
        this.setState({ loading: true });
        redirectingAuthorizedFetch(endpointUrl, {
          method: 'POST',
          body: JSON.stringify(this.state.data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (response.status === 200) {
            return response.json();
          }
          throw Error("Invalid status code: " + response.status);
        }).then(json => {
          this.props.enqueueSnackbar("Changes successfully applied.", { variant: 'success' });
          this.setState({ data: json, loading: false });
        }).catch(error => {
          const errorMessage = error.message || "Unknown error";
          this.props.enqueueSnackbar("Problem saving: " + errorMessage, { variant: 'error' });
          this.setState({ data: undefined, loading: false, errorMessage });
        });
      }

      handleValueChange = (name: keyof D) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const data = { ...this.state.data!, [name]: extractValue(event) };
        this.setState({ data });
      }

      handleSliderChange = (name: keyof D) => (event: React.ChangeEvent<{}>, value: number | number[]) => {
        const data = { ...this.state.data!, [name]: value };
        this.setState({ data });
      };

      render() {
        return <RestController
          handleValueChange={this.handleValueChange}
          handleSliderChange={this.handleSliderChange}
          setData={this.setData}
          saveData={this.saveData}
          loadData={this.loadData}
          {...this.state}
          {...this.props as P}
        />;
      }

    });
}
