import { Notelist } from "../src/notelist";
import { getNote } from "./tools";

let notelist = null;

describe("body", function () {
  beforeEach(async () => {
    notelist = new Notelist() as any;
    notelist.settings = {};
  });

  afterEach(async () => {});

  describe(`Excerpt`, function () {
    const testCases = [
      {
        description: "First test",
        note: "testnote1",
        bodyExcerpt: 130,
        expected:
          "Welcome to Joplin! Joplin is a free, open source note taking and to-do application, which helps you write and organise your notes, ...",
      },
      {
        description: "Short",
        note: "testnote1",
        bodyExcerpt: 10,
        expected: "Welcome to ...",
      },
      {
        description: "Markings",
        note: "testnote2",
        bodyExcerpt: 100,
        expected:
          "Exporting notes Joplin can export to the JEX format (Joplin Export file), which is an archive that ...",
      },
      {
        description: "Nearly only URLs",
        note: "urls",
        bodyExcerpt: 130,
        expected: `To check https://test1.com/product/3574/9851?gad_source=1 https://test2.com/product/test-product/ ...`,
      },
    ];

    for (const testCase of testCases) {
      it(`${testCase.description}`, async () => {
        notelist.settings["bodyExcerpt"] = testCase.bodyExcerpt;
        const note = await getNote(testCase.note);
        const result = await notelist.getBody(note.body);
        expect(result).toBe(testCase.expected);
      });
    }
  });
});
