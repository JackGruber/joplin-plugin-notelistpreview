import { Notelist } from "../src/notelist";
import { getNote } from "./tools";

let notelist = null;

it("Resource Order", async () => {
  notelist = new Notelist() as any;
  notelist.settings = {};

  const note = await getNote("resourcesNote");
  const result = await notelist.getResourceOrder(note.body);

  const expected = [
    "f16103b064d9410384732ec27cd06efb",
    "a7f9ed618c6d427395d1ef1db2ee2000",
    "766bf08661e51d3897e6314b56f4d113",
    "a1fd1b6fd6be4ab58f99e01beb704b18",
    "8f99e01beb704b18a1fd1b6fd6be4ab5",
    "8f99tr1beb7a1fd1b6fd6b4d11368a71",
    "71077b1a82516888b8f01a215db0c9de",
  ];

  expect(result).toStrictEqual(expected);
});
