import React from 'react';
import { Checkbox } from './checkbox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from './field';
import { Label } from './label';

export function CheckboxDemo() {
  return (
    <FieldGroup className="max-w-sm">
      <Field orientation="horizontal">
        <Checkbox id="terms-checkbox" name="terms-checkbox" />
        <Label htmlFor="terms-checkbox">Accept terms and conditions</Label>
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id="terms-checkbox-2"
          name="terms-checkbox-2"
          defaultSelected
        />
        <FieldContent>
          <FieldLabel htmlFor="terms-checkbox-2">
            Accept terms and conditions
          </FieldLabel>
          <FieldDescription>
            By clicking this checkbox, you agree to the terms.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="toggle-checkbox" name="toggle-checkbox" isDisabled />
        <FieldLabel htmlFor="toggle-checkbox" className="opacity-50">Enable notifications (Disabled)</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" defaultChecked />
        <FieldContent>
          <FieldTitle>Enable AI agent telemetry notifications</FieldTitle>
          <FieldDescription>
            You can enable or disable notifications at any time.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  );
}
