import { IKeyValue } from '@wetrial/core';
<% if (external.isApp) { %>//<% } %> import <%= external.upperCaseName %>Permissions from '@/modules/<%= external.lowerCaseName %>';
import { IGlobalProps } from '@/services/global.d';

export default function (initialState: IGlobalProps) {
  const { currentUser } = initialState;
  if (currentUser) {
  const allPermissions = {
    <% if (external.isApp) { %>//<% } %> ...<%= external.upperCaseName %>Permissions,
  };

  const flatPermissions = dgFlatPermissions(allPermissions, currentUser.permissions);
    return flatPermissions;
  } else {
    return [];
  }
}

function dgFlatPermissions(
  allPermissions: IKeyValue,
  curPermissions: string[] = [],
): IKeyValue<boolean> {
  let result: IKeyValue<boolean> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in allPermissions) {
    if (allPermissions.hasOwnProperty(key)) {
      if (typeof allPermissions[key] === 'string') {
        result[allPermissions[key]] = curPermissions.indexOf(allPermissions[key]) !== -1;
      } else {
        const subResult = dgFlatPermissions(allPermissions[key], curPermissions);
        result = {
          ...result,
          ...subResult,
        };
      }
    }
  }
  return result;
}
